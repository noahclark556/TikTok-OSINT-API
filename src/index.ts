import express, { Request, Response } from 'express';
import cors from 'cors';
import {OsintX} from './logic/api/osintt'

const app = express();
const port = process.env.PORT || 8080;
app.use(cors());

app.get('/ttosint', async (req: Request, res: Response) => {
    try {
        const username = req.query.username as string;
        const key = req.query.apikey as string;
        const q = JSON.parse(req.query.query as string);

        if (!key || (key && key != 'noahclark556')) {
            res.json({ error: 'Invalid API Key' });
            console.log('Invalid API Key');
            return;
        }

        let osintApi = new OsintX();

        const query = osintApi.buildQuery(username, q);
        const result = await osintApi.executeQuery(query);

        res.json({ data: result });
    } catch (error) {
        console.error('Error in /ttosint:', error);
        res.json({ error: 'Failed to fetch user data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
