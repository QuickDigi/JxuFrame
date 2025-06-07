import SendPHPFile from "./Runner/SendPHPFile";

class InternalC {

    static Runner = {
        SendPHPFile: (filePath: string, res: any, req: any, options: any = {}) => {
            SendPHPFile(filePath, res, req, options)
        },
    }
};
export default InternalC;