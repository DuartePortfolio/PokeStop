const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const sequelize = require('./services/sequelize');
const User = require('./models/User');

app.use(express.json());
app.use('/users', userRoutes);

sequelize.sync().then(() => {
	const PORT = process.env.PORT || 3001;
	app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
});
