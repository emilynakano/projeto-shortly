import connection from "../db/postgres.js";
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'


export async function signUp(req, res) {
    const {name, email, password} = req.body;
    try {
        const { rowCount } = await connection.query(`
        SELECT * FROM users WHERE email=$1`, [email]
        )
    
        if(rowCount > 0) {
            return res.sendStatus(409)
        }
    
        const passwordHash = bcrypt.hashSync(password, 10);
    
        await connection.query(`
        INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`, 
        [name, email, passwordHash] )
    
        res.sendStatus(201)
    } catch {
        res.sendStatus(500)
    }
}
export async function signIn(req, res) {
    const {email, password} = req.body;
    try {
        const {rows: users, rowCount} = await connection.query(`
        SELECT * FROM users WHERE email=$1`,
        [email]);
    
        const user = users[0];
    
        if(rowCount > 0 && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
    
            await connection.query(`
            INSERT INTO sessions ("userId", token) VALUES ($1, $2)`, [user.id, token]);
    
            return res.status(200).send(token)
        } else {
            return res.sendStatus(401)
        }
    } catch {
        res.sendStatus(500)
    }

}

