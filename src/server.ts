import dotenv from 'dotenv';
import App from './app';
import { AuthRoute, BrandRoute, CommentRoute, MemberRoute, WatchRoute } from './modules/routes';


dotenv.config();


const routes = [
   new MemberRoute(),
   new AuthRoute(),
   new WatchRoute(),
   new BrandRoute(),
   new CommentRoute(),
];

const app = new App(routes);

app.listen();
