const fs = require('fs');
const path = require('path');

const fileName = path.join(__dirname, '..', 'dev-data', 'data', 'users.json');

exports.getAllUsers = (_, res) => {
  fs.readFile(fileName, 'utf-8', (error, data) => {
    if (error) return res.status(500).send('Something went wrong!');

    const users = JSON.parse(data);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  });
};

exports.getUser = (req, res) => {
  fs.readFile(fileName, 'utf-8', (error, data) => {
    if (error) return res.status(500).send('Something went wrong!');

    const users = JSON.parse(data);
    const user = users.find(user => user._id === req.params.id);

    if (!user)
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });
};
