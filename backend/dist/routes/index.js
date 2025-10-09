"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const events_1 = __importDefault(require("./events"));
const transactions_1 = __importDefault(require("./transactions"));
const users_1 = __importDefault(require("./users"));
const organizer_1 = __importDefault(require("./organizer"));
const router = express_1.default.Router();
router.use('/auth', auth_1.default);
router.use('/events', events_1.default);
router.use('/transactions', transactions_1.default);
router.use('/users', users_1.default);
router.use('/organizer', organizer_1.default);
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'EventHub API is running!',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map