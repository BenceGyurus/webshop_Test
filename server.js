const http = require('http');
const selector = require(__dirname+"/selector.js");
const fs = require("fs");
const encryption = require(`${__dirname}/encryption.js`)

var all_User = {}; //ip: [user, token, long token]
var loged_In_Users = {}; //token : [ip, user name]


class control_User{
    static valid_Cookie(token, ip){
        if (loged_In_Users[token][0] == ip) return true;else return false;
    }

    static valid_Short_Token(token, ip){ 
        if (loged_In_Users[token][0] == ip)return true; else return false;
    }
}

function add_User(){
    fs.writeFileSync("all_User.json", JSON.stringify(all_User));
}

function open(path){
    try{
        return fs.readFileSync(__dirname+"/"+path);
    }catch{
        return false;
    }
}

class add_Cookie{

    static login_Token(res){
        this.res = res;
        let token = login.random_Token();
        this.res.writeHead(200)
        this.res.end(JSON.stringify({name: "login_Token", value: token}));
        return token;
    }
}

class token_Setings{
    static set_Token(token, datas){
        if (!loged_In_Users[token]){
            loged_In_Users[token] = datas;
            return true;
        }
        else{
            return false;
        }
    }
    static delete_Token(token){
        if (loged_In_Users[token]){
            delete loged_In_Users[token];
        }
    }
}

class login{
    static token = "";
    static send_Data = {};
    static users = {};
    static req;
    static res;
    static ip;
    static random_Token(){
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
        let length = 100;
        for (let i = 0; i < length; i++){
            this.token += chars[Math.floor(Math.random()*chars.length-1)];
        }
        return this.token;
    }
    
    static send(d,res){
        this.res.writeHead(200);
        this.res.end(d);
    }


    static short_Token(){
        let token = "";
        for (let i = 0; i < 100; i++){
            token += Math.ceil(Math.random()*10)
        }
        return token
    }

    static admin(req, res, body, ip){
        this.req = req; this.res = res;
        this.users = JSON.parse(open("admin.json"));
        this.ip = ip;
        body = JSON.parse(body);
        if (this.users[body.mail]){
            if (this.users[body.mail].password == encryption(body.password)){
            let short_Token = this.short_Token();
            all_User[ip] = {short_Token: short_Token, valid: 1}
            this.send(JSON.stringify({message: "Sikeres bejelentkezés", token: short_Token, response: true},res));
            token_Setings.set_Token();
            }
            else{
                this.send(JSON.stringify({message: "Helytelen jelszó"},res))
            }
        }
        else{
            this.send(JSON.stringify({message: "Helytelen felhasználónév"},res))
        }
    }
}

class method{
    static req;
    static res;
    static file;
    static extension;
    static status;
    static ip;
    static url;
    static add_Method(req, res){
        this.req = req;this.res = res;
        this.url = req.url;
        this.ip = req.connection.remoteAddress;
        if (this.req.method == "POST"){this.post()}else{this.get()}
        this.log();
    }

    static log(){
        if (!all_User[this.ip]){
            all_User[this.ip] = [];    
        }
        //console.log(all_User);
    }

    static get_Header(){
        if (this.extension == "html"){
            return "content-type: text/html";
        } 
        else if (this.extension == "jpg" ||this.extension == "img" || this.extension == "jfif" || this.extension == "svg" || this.extension == "png"){
            return `content-type: image/${this.extension}`;
        }
        else if (this.extension == "json"){
            return `content-type: application/json`;
        }
    }

    static post(){
        var body = "";
        var res = this.res;
        this.req.on("data", function (chunk) {
            body += chunk;
            console.log(this.url)
            switch(this.url){
                case "/adminlogin":
                    login.admin(this.req, res, body, this.ip);
                    break;
                case "/admin-login-cookie":
                    add_Cookie.login_Token(res);
                    break;
                case "/admin/edit":
                    console.log("edit");
                    break;
            }
        });
    }

    static send_Data(){
        let header = this.get_Header();
        this.res.writeHead(this.file ? 200:404, header);
        this.res.end(this.file);
    }

    static get_File_Data(path){
        return selector.get_File(path);
    }

    static get(){
        //let url = this.req.url == "/" ? "" : this.req.url;
        let url = this.req.url
        if (url.split(".").length-1 < 1){
            let paths = JSON.parse(open("path.json"));
            //console.log(url.split("/"));
            if (url == "/"){
                url = "/kezdolap";    
            }
            //console.log(paths["admin"]);
            let path = paths[url.split("/")[1]];
            //console.log(path);
            this.file = path ? this.get_File_Data(`${path}`): "404 error";
        }
        else{
            this.file = this.get_File_Data(url);
        }
        this.extension = url.split(".")[url.split(".").length-1];
        this.send_Data();
    }
}

const requestListener = function (req, res) {
    method.add_Method(req, res);
}

const server = http.createServer(requestListener);
server.listen(8080);