import {Router} from 'express'
import { parseResume } from '../controllers/ParseResume';
import upload from '../middleware/upload';
import { profileMatching } from '../controllers/ProfileMatching';

const routes = Router();

routes.post('/parse-resume', upload.single("pdf"), parseResume);
routes.post('/profile-match', profileMatching);


routes.get('/', (req, res)=>{
    res.send("Server is working ");
})

export default routes;