const passport = require("passport");

let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require("../models").User;

module.exports = (passport) =>{
    let opts = {
        jwtFromRequest : ExtractJwt.fromAuthHeaderWithScheme("jwt"),
        secretOrKey : process.env.PASSWORD_SECRET,
        failWithError: true,
    };
    passport.use(new JwtStrategy(opts,async function(jwt_payload,done){
        try{
            let foundUser = await User.findOne({_id:jwt_payload._id}).exec();
            //console.log(foundUser);
            if(foundUser){
                //console.log(jwt_payload);
                return done(null,foundUser);
            }else{
                //console.log(jwt_payload);
                return done(null,false);
                //予備用：,{message:"ログインしてください。",}
            }
        }catch(e){
            console.log(e);
            return done(err,false);
        }
    }));
}