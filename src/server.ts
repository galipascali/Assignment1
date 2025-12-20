import { Express } from "express";
import initApp from "./index";

const port = process.env.PORT;

initApp().then((app: Express) => {
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
});
