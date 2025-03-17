const http = require('http')
const fs = require('fs')
const url = require('url')
const { NotFoundError, DonNotWritingFile} = require('./AppError')
const db = require('./db.json')
let primaryCrime = 0
function validUser(database, nUser){
    return database.users.some((user) => (user.username === nUser.username || user.email === nUser.email))
}
const server = http.createServer((req, res) => {
    if(req.method === "GET" && req.url === "/api/users"){ // GetAllUsers API
        fs.readFile("db.json", (err, data) => {
            if(err){
                res.writeHead(500, {'Content-type': 'text/plain'})
                res.write("The connection of database encountered with a wrong!!!")
                res.end()
                return;
            }
            try{
                let jsonData = JSON.parse(data)
                res.writeHead(200, {'Content-type': 'application/json'})
                res.write(JSON.stringify(jsonData.users))
                res.end()
            }catch(parseError){
                console.log("Parse Error")
            }
        })
    }else if(req.method === "GET" && req.url === "/api/books"){ // GetAllBooks API
        fs.readFile("db.json", (err, data) => {
            if(err){
                res.writeHead(500, {'Content-type': 'text/plain'})
                res.write("The connection of database encountered with a wrong!!!")
                res.end()
                return;
            }
            try{
                let jsonData = JSON.parse(data)
                res.writeHead(200, {'Content-type': 'application/json'})
                res.write(JSON.stringify(jsonData.books))
                res.end()
            }catch(parseError){
                console.log("Parse Error")
            }
        })
    }else if(req.method === "POST" && req.url === "/api/books/rents"){ // ReserveBook API
        console.log("Welcome to RESERVE")
        let _ = ""
        req.on('data', (chunk) => _ += chunk.toString())
        req.on('end', () => {
            const {userId, title} = JSON.parse(_)
            const indexBook = db.books.findIndex((book) => book.title === title)
            console.log(title)
            if(indexBook !== -1){
                if(db.books[indexBook].free === 1){
                    const newRent = {id: Math.random(), userId: userId, bookId: db.books[indexBook].id}
                    db.rents.push(newRent)
                    db.books[indexBook].free = 0
                    fs.writeFile("db.json", JSON.stringify(db), (err) => {
                        if(err){
                            throw new DonNotWritingFile(); 
                        }
                        res.writeHead(201, {"Content-type": 'application/json'})
                        res.write(JSON.stringify({massage: "Reserving Book is Successful"}))
                        res.end()
                    })
                }else{
                    res.writeHead(401, {'Content-type': 'application/json'})  
                    res.write(JSON.stringify({massage: "Book Were Reserved!!!"}))    
                    res.end()
                }
            }else{
                  res.writeHead(409, {'Content-type': 'application/json'})  
                  res.write(JSON.stringify({massage: "Book Not Found!!!"}))    
                  res.end()                                                  
            }
        })
    }else if(req.method === "PUT" && req.url === "/api/books/back"){
        console.log("welcome to Back")
        let _ = ""
        req.on('data', (chunk) => _ += chunk.toString())
        req.on('end', () => {
            const backBook = JSON.parse(_)
            const indexBook = db.books.findIndex((book) => book.title === backBook.title)
            db.books[indexBook].free = 1
            const reminedRents = db.rents.filter((rent) => rent.bookId !== db.books[indexBook].id)
            console.log(reminedRents)
            fs.writeFile("db.json", JSON.stringify({...db, rents: reminedRents}), (err) => {
                if(err){
                    throw new DonNotWritingFile();
                }
                res.writeHead(202, {"Content-type": 'application/json'})
                res.write(JSON.stringify({massage: "Freeing Book is Successful"}))
                res.end()
            })
        })
    }else if(req.method === "DELETE" && req.url.startsWith("/api/books")){ // DeleteBook API
        const urlParams = url.parse(req.url, true)
        console.log(urlParams)
        const bookId = parseInt(urlParams.query.id)
        // console.log(typeof bookId)
        // console.log(bookId)
        // console.log(db.books.some((book) => book.id === bookId))
        if(db.books.some((book) => book.id === bookId)){
            const reminedBook = db.books.filter(function(BOOK){
                return bookId !== BOOK.id
            })
            // console.log(reminedBook)
            // console.log(urlParams)
            // const ids = db.books.map(book => book.id)
            // console.log(ids)
            // const id = urlParams.query.id
            // const pathname = urlParams.pathname
            // console.log(id)
            // console.log(pathname)
            fs.writeFile("db.json", JSON.stringify({...db, books: reminedBook}), (err) => {
                if(err){
                    res.writeHead(500, {'Content-type': 'text/plain'})
                    res.write("Error for Database!!!")
                    res.end()
                }
                res.writeHead(200, {'Content-type': 'application/json'})
                res.write(JSON.stringify({massage: "Book Removed Successfully"}))
                res.end()
            })
        }else{
            // throw new NotFoundError(bookId)
            res.writeHead(401, {'Content-type': 'application/json'})
            res.write(JSON.stringify({massage: "Book Not Found!!!"}))
            res.end()
        }
        // res.end("Test Response")
        
    }else if(req.method === "POST" && req.url ==="/api/books"){ // AddBook API
        let book = ""
        req.on('data', (chunk) => {
            book += chunk.toString()
        })
        req.on('end', () => {
            const newBook = { id: Math.random(), ...JSON.parse(book), free: 1 }
            db["books"].push(newBook)
            fs.writeFile("db.json", JSON.stringify(db), (err) => {
                if(err){
                    throw new DonNotWritingFile();
                }
                res.writeHead(201, {"Content-type": 'application/json'})
                res.write(JSON.stringify({massage: "Adding File Success"}))
                res.end()
            })
            res.end("Adding New Book Success.")
        })
        
    }else if(req.method === "PUT" && req.url.startsWith("/api/books")){ // UpdataBook API
        console.log("Welcome to 'Book")
        const urlParams = url.parse(req.url, true)
        const id = parseInt(urlParams.query.id)
        if(db.books.some(book => book.id === id)){
            let book = ""
            req.on('data', (chunk) => {
                book += chunk.toString()
            })
            req.on('end', () => {
                // First Way
                // const updataBook = {id: id, ...JSON.parse(book), free: 1}
                // const index = db.books.findIndex(book => book.id === id)
                // db.books[index] = updataBook
                // Second Way
                const reqBody = JSON.parse(book)
                db.books.forEach((book) => {
                    if(book.id === id){
                        book.title = reqBody.title
                        book.author = reqBody.author
                        book.price = reqBody.price
                    }
                })
                fs.writeFile("db.json", JSON.stringify(db), (err) => {
                    if(err){
                        throw new DonNotWritingFile();
                    }
                    res.writeHead(202, {"Content-type": 'application/json'})
                    res.write(JSON.stringify({massage: "Updating Book Success"}))
                    res.end()
                })
            })
        }else{
            res.writeHead(401, {'Content-type': 'application/json'})
            res.write(JSON.stringify({massage: "Book Not Found!!!"}))
            res.end()
        }
    }else if(req.method === "POST" && req.url === "/api/users/login"){ // Login API
        let _ = ""
        req.on('data', (chunk) => _ += chunk.toString())
        req.on('end', () => {
            const {username, email} = JSON.parse(_)
            if(db.users.some((user) => user.username === username && user.email === email)){
                res.writeHead(200, {'Content-type': 'application/json'})
                res.write(JSON.stringify({username: username, email: email}))
                res.end()
            }else{
                res.writeHead(401, {'Content-type': 'application/json'})
                res.write(JSON.stringify({massage: "You Need to Register"}))
                res.end()
            }
        })
    }else if(req.method === "POST" && req.url === "/api/users"){ // Add or RegisterUser API
        let user = "";
        req.on('data', (chunk) => {
            user += chunk.toString()
        })
        req.on('end', () => {
            if(validUser(db, JSON.parse(user))){
                res.writeHead(422, {'Content-type': 'application/json'})
                res.write(JSON.stringify({massage: "Eamil or Username already is Exist!!!"}))
                res.end()
            }else if(JSON.parse(user).name === "" || JSON.parse(user).username === "" || JSON.parse(user).email === ""){
                res.writeHead(422, {'Content-type': 'application/json'})
                res.write(JSON.stringify({massage: "Your Data is not Valid!!!"}))
                res.end()
            }else{
                const newUser = {id: Math.random(), ...JSON.parse(user), crime: 0, role: "USER"}
                db.users.push(newUser)
                fs.writeFile("db.json", JSON.stringify(db), (err) => {
                    if(err){
                        throw new DonNotWritingFile();
                    }
                    res.writeHead(201, {"Content-type": 'application/json'})
                    res.write(JSON.stringify({massage: "Updating File Success"}))
                    res.end()
                })
            }
        })
    }else if(req.method === "PUT" && req.url.startsWith("/api/users/upgrade")){  // UpgradingUser API
        console.log("Welcome to Upgrade")
        const urlParams = url.parse(req.url, true)
        const userId = parseInt(urlParams.query.id)
        if(db.users.some((user) => user.id === userId)){
            const index = db.users.findIndex((user) => user.id === userId)
            db.users[index].role = "ADMIN"
            fs.writeFile("db.json", JSON.stringify(db), (err) => {
                if(err){
                    throw new DonNotWritingFile(); 
                }
                res.writeHead(200, {"Content-type": 'application/json'})
                res.write(JSON.stringify({massage: "Upgrading USER to ADMIN are Successfully"}))
                res.end()
            })
        }
    }else if(req.method === "PUT" && req.url.startsWith("/api/users")){ // UpdataCrime API

        const urlParams = url.parse(req.url, true)
        const id = parseInt(urlParams.query.id)
        if(db.users.some((user) => user.id === id)){
            // primaryCrime++
            // db.users[index].crime = primaryCrime
            let reqBody = ""
            req.on('data', (chunk) => reqBody += chunk.toString())
            req.on('end', () => {
                const index = db.users.findIndex((user) => user.id === id)
                db.users[index].crime = JSON.parse(reqBody).crime
                fs.writeFile("db.json", JSON.stringify(db), (err) => {
                    if(err){
                        res.writeHead(500, {'Content-type': 'text/plain'})
                        res.write("Error for Database!!!")
                        res.end()
                    }
                    res.writeHead(200, {'Content-type': 'application/json'})
                    res.write(JSON.stringify({massage: "Appdating Crime is Successfully"}))
                    res.end()
                })
            })
        }else{
            res.writeHead(401, {'Content-type': 'application/json'})
            res.write(JSON.stringify({massage: "ID Not Found!!!"}))
            res.end()
        }
    }
})
server.listen(4000, () => {
    console.log("Server is running on port 4000")
})
