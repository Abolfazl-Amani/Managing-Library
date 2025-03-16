const http = require('http')
const fs = require('fs')
const url = require('url')
const { NotFoundError, DonNotWritingFile} = require('./AppError')
const db = require('./db.json')
// console.log(db.users)
let primaryCrime = 0
const server = http.createServer((req, res) => {
    if(req.method === "GET" && req.url === "/api/users"){
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
    }else if(req.method === "GET" && req.url === "/api/books"){
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
    }else if(req.method === "DELETE" && req.url.startsWith("/api/books")){ 
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
        
    }else if(req.method === "POST" && req.url ==="/api/books"){
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
        
    }else if(req.method === "PUT" && req.url.startsWith("/api/books")){
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
                    res.write(JSON.stringify({massage: "Updating File Success"}))
                    res.end()
                })
            })
        }else{
            res.writeHead(401, {'Content-type': 'application/json'})
            res.write(JSON.stringify({massage: "Book Not Found!!!"}))
            res.end()
        }
    }else if(req.method === "POST" && req.url === "/api/users"){
        let user = ""
        req.on('data', (chunk) => {
            user += chunk.toString()
        })
        req.on('end', () => {
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
        })
    }else if(req.method === "PUT" && req.url.startsWith("/api/users")){
        const urlParams = url.parse(req.url, true)
        const id = parseInt(urlParams.query.id)
        if(db.users.some((user) => user.id === id)){
            // primaryCrime++
            // db.users[index].crime = primaryCrime
            const reqBody = ""
            req.on('data', (chunk) => reqBody += chunk.toString())
            req.on('end', () => {
                const index = db.users.findIndex((user) => user.id === id)
                db.users[index].crime = reqBody.crime
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
            res.write(JSON.stringify({massage: "Book Not Found!!!"}))
            res.end()
        }
    }
})

server.listen(4000, () => {
    console.log("Server is running on port 4000")
})