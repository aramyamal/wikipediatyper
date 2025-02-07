import { app } from "./start";

const PORT : number = 3000;

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

