const fs = require('fs');
const path = require('path');

const fileName = path.join(
  __dirname,
  '..',
  'dev-data',
  'data',
  'tours-simple.json'
);

exports.getAllTours = (_, res) => {
  fs.readFile(fileName, 'utf-8', (error, data) => {
    if (error) return res.status(500).send('Something went wrong!');

    const tours = JSON.parse(data);

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  });
};

exports.getTour = (req, res) => {
  fs.readFile(fileName, 'utf-8', (error, data) => {
    if (error) return res.status(500).send('Something went wrong!');

    const tours = JSON.parse(data);
    const tour = tours.find(tour => tour.id === Number(req.params.id));

    if (!tour)
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  });
};

exports.createNewTour = (req, res) => {
  fs.readFile(fileName, 'utf-8', (error, data) => {
    if (error) return res.status(500).send('Something went wrong!');

    const tours = JSON.parse(data);
    const newTour = { id: tours.at(-1).id + 1, ...req.body };

    tours.push(newTour);
    fs.writeFile(fileName, JSON.stringify(tours), error => {
      if (error) return res.status(500).send('Something went wrong!');

      res.status(201).json({
        status: 'success',
        data: { tour: newTour },
      });
    });
  });
};
