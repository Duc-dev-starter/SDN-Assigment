
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import morgan from "morgan";
import { IRoute } from "./core/interfaces";
import { logger } from "./core/utils";
import { errorMiddleware } from "./core/middlewares";
import path from "path";
import session from "express-session";
import flash from 'connect-flash';
import methodOverride from 'method-override';
import { HttpStatus } from "./core/enums";

export default class App {
    public app: express.Application;
    public port: string | number;
    public production: boolean;

    constructor(routes: IRoute[]) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.production = !!(process.env.NODE_ENV === "production");

        this.connectToDatabase();
        this.initializeMiddleware();
        this.initializeRoute(routes);
        this.initializeErrorMiddleware();
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`Server is running at port ${this.port}`);
        });
    }

    // connect to mongoDB
    private connectToDatabase() {
        const mongoDbUri = process.env.MONGODB_URI;
        if (!mongoDbUri) {
            logger.error("MongoDb URI is empty!");
            return;
        }
        mongoose.connect(mongoDbUri).catch((error) => {
            logger.error("Connection to database error: " + error);
        });
        logger.info("Connection to database success!");
    }

    // declare middleware
    private initializeMiddleware() {
        if (this.production) {
            this.app.use(hpp());
            this.app.use(helmet());
            this.app.use(morgan("combined"));
            // this.app.use(cors({ origin: "your.domain.com", credentials: true }));
            this.app.use(cors({ origin: true, credentials: true }));
        } else {
            this.app.use(morgan("dev"));
            this.app.use(cors({ origin: true, credentials: true }));
        }
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.join(__dirname, 'modules/views'));
        this.app.use(express.static(path.join(__dirname, 'modules/public')));
        this.app.use(session({
            secret: 'secret',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7,
            }
        }))
        this.app.use(methodOverride('_method'));
        this.app.use(flash());
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.info_msg = req.flash('info_msg');
            next();
        });
    }

    // declare error handler middleware
    private initializeErrorMiddleware() {
        this.app.use(errorMiddleware);
    }

    // declare init router
    private initializeRoute(routes: IRoute[]) {
        routes.forEach((route) => {
            this.app.use("/", route.router);
        });
        this.app.get('*', (req, res) => {
            const member = req.session.member 
            res.status(HttpStatus.NotFound).render('404', {member});
        })
    }
}