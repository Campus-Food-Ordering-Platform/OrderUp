import express from "express";
const app =express();
app.get("/",(req,res)=>{

res.send("youre doin ight bro");


})
export default app;