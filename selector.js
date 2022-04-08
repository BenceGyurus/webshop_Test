fs = require("fs");
class file{
    static openFile(file_Name){
        try {
            return fs.readFileSync(file_Name);
        } catch {
            return false;
        }
    }
}

class selector{
    static file_Name;
    static file_Data;
    static get_File(file_Name){
        console.log(file_Name)
        this.file_Name = file_Name;
        this.file_Data = file.openFile(`${__dirname}/source/${file_Name}`);
        return this.file_Data;
    }
}

module.exports = selector;