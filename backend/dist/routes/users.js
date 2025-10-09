"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/profile', userController_1.getUserProfile);
router.put('/profile', userController_1.updateUserProfile);
router.get('/points', userController_1.getUserPoints);
router.get('/coupons', userController_1.getUserCoupons);
exports.default = router;
//# sourceMappingURL=users.js.map