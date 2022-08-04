import connection from '../databases/postgres.js'
import { nanoid } from 'nanoid'

export async function createShortUrl(req, res) {
    const { url } = req.body;
    const {user} = res.locals;

    const shortUri = nanoid();

    try {
        await connection.query(`
        INSERT INTO "shortenedUrls" ("userId", "shortUrl", "url") VALUES ($1, $2, $3)`,
        [user[0].id, shortUri, url])
    
        res.send({"shortUri": shortUri}).status(201)
    } catch {
        res.sendStatus(500)
    }

}

export async function getUrlById(req, res) {
    try {
        const {rows: url, rowCount} = await connection.query(`
        SELECT id, "shortUrl", url FROM "shortenedUrls" WHERE id=$1`,
        [req.params.id]);
    
        if(rowCount === 0) {
            return res.sendStatus(404)
        }
    
        res.send(url[0]).status(200)
    } catch {
        res.sendStatus(500)
    }

}