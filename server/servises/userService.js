const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mailService')
const tokenService = require('./tokenService')
const UserDto = require('../dtos/user_dto')
const ApiError = require('../exceptions/api-errors')
const {hash} = require("bcrypt");
class UserService {
    async registration(email, password){
        const candidate = await userModel.findOne({email})
        if(candidate){
            throw ApiError.BadRequest(`User with email address ${email} already exist`);
        }
        const hashPassword = await bcrypt.hash(password, 7);
        const activateLink = uuid.v4();
        const user = await userModel.create({email, password: hashPassword, activationLink:activateLink})
        await mailService.sendActivationMail(email,`${process.env.API_URL}/api/activate/${activateLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async login(email, password){
        const user = await userModel.findOne({email})
        if(!user){
            throw ApiError.BadRequest(`User with email address ${email} don't exist`);
        }
        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword){
            throw ApiError.BadRequest(`Wrong password`);
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await userModel.findOne({activationLink: activationLink})
        if(!user){
            throw ApiError.BadRequest("Invalid activation link");
        }
        user.isActivated = true;
        await user.save();
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFind = tokenService.findToken(refreshToken);
        if(!userData || !tokenFind){
            throw ApiError.UnauthorizedError();
        }
        const user = userModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async findAllUsers(){
        const users = await userModel.find();
        return users;
    }
}

module.exports = new UserService();