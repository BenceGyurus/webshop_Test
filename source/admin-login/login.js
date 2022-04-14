var send = false;
function get_Datas(){
    let ar = [];
    let ids = ["mail", "password"];
    for (let i = 0; i < 2; i++){
        ar.push(document.getElementById(ids[i]).value);
    }
    return ar;
}

function element_Error(error){
    document.getElementById("error").innerHTML = error;
}
function clear_Error(){
    document.getElementById("error").innerHTML = "";
}

function control_Auto_Login(){
    console.log("try");
    if (parse_Cookies().login_Token.length > 10){
        console.log("auto login");
        window.location = "/admin";
    }
}

function cookie_Request(){

}

function send_This(){
    clear_Error();
    let datas = get_Datas();
    let errors = []
    datas[0].length > 3 || datas[1].length > 3 ? "" : errors.push("A jelszónak és az email címnek legalább 3 karakterből kell állnia");
    if (errors.length > 0){
        window.send = false;
    } 
    else{
        window.send = true;
    }
    if (window.send){
        let json = JSON.stringify({
            mail: datas[0],
            password: datas[1]
        });
        req = new XMLHttpRequest();
        req.onreadystatechange = ()=>{
            if (req.readyState == 4 && req.status == 200){
                datas = JSON.parse(req.responseText);
                if (datas.response){
                    req = new XMLHttpRequest();
                    req.onreadystatechange = ()=>{
                        if (req.readyState == 4 && req.status == 200){
                            let next = add_Cookie(JSON.parse(req.responseText));
                            if (next){
                            window.location = "/admin";
                            }
                        }
                    }
                    req.open("POST", "/admin-login-cookie");
                    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    req.send(JSON.stringify({token: datas.token}));
            }
            }
        }
        req.open("POST", "/adminlogin");
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send(json);
    }
    else{
        element_Error(errors[0]);
    }
}

control_Auto_Login();