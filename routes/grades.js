import express from 'express';
import { promises } from 'fs';

const router = express.Router();
const readFile = promises.readFile;
const writeFile = promises.writeFile;

router.post('/', async (req, res) => {
  let grade = req.body;

  try {
    const data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let date = new Date();

    grade = { id: json.nextId++, ...grade, timestamp: date };
    json.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(json));
    res.send(grade);
    logger.info(`POST /grade - ${JSON.stringify(grade)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /grade ${err.message}`);
  }
});

router.get('/', async (_, res) => {
  try {
    const data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    delete json.nextId;
    res.send(json);
    logger.info('GET /grade');
  } catch {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade ${err.message}`);
  }
});

router.get('/total', async (req, res) => {
  let studentAndSubject = req.body;

  try {
    const data = await readFile(global.fileName, 'utf8');
    const json = JSON.parse(data);
    const { student, subject } = studentAndSubject;

    const totalGrade = json.grades
      .filter((grade) => {
        return grade.student === student && grade.subject === subject;
      })
      .reduce((accumulator, current) => {
        return accumulator + current.value;
      }, 0);

    res.send({ total: totalGrade });
    logger.info(`GET /grade/total - ${JSON.stringify(totalGrade)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/total ${err.message}`);
  }
});

router.get('/average', async (req, res) => {
  let subjectAndType = req.body;

  try {
    const data = await readFile(global.fileName, 'utf8');
    const json = JSON.parse(data);
    const { subject, type } = subjectAndType;

    const filterdGrades = json.grades.filter((grade) => {
      return grade.subject === subject && grade.type === type;
    });

    const sumOfGrades = filterdGrades.reduce((accumulator, current) => {
      return accumulator + current.value;
    }, 0);

    const averageGrade =
      sumOfGrades > 0
        ? parseFloat((sumOfGrades / filterdGrades.length).toFixed(2))
        : 0;

    res.send({ average: averageGrade });
    logger.info(`GET /grade/average - ${JSON.stringify(averageGrade)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/average ${err.message}`);
  }
});

router.get('/bigger', async (req, res) => {
  let subjectAndType = req.body;

  try {
    const data = await readFile(global.fileName, 'utf8');
    const json = JSON.parse(data);
    const { subject, type } = subjectAndType;

    const filterdGrades = json.grades.filter((grade) => {
      return grade.subject === subject && grade.type === type;
    });

    const sortedGrades = filterdGrades.sort((a, b) => {
      return b.value - a.value;
    });

    let threeBests = [];

    for (let i = 0; i < 3; i++) {
      threeBests = [...threeBests, sortedGrades[i]];
    }

    res.send(threeBests);
    logger.info(`GET /grade/bigger - ${JSON.stringify(threeBests)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade/bigger ${err.message}`);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const data = await readFile(global.fileName, 'utf8');
    const json = JSON.parse(data);
    const grade = json.grades.find((grade) => grade.id === id);

    grade ? res.send(grade) : res.end();
    logger.info(`GET /grade:id - ${JSON.stringify(grade)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grade:id ${err.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    const grades = json.grades.filter((grade) => grade.id !== id);
    json.grades = grades;

    await writeFile(global.fileName, JSON.stringify(json));
    res.end();
    logger.info(`DELETE /grade:id - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE /grade:id ${err.message}`);
  }
});

router.put('/', async (req, res) => {
  const newGrade = req.body;
  let data = await readFile(global.fileName, 'utf8');

  let json = JSON.parse(data);
  // prettier-ignore
  const oldIndex = json.grades.findIndex(grade => grade.id === newGrade.id);

  if (oldIndex === -1) res.status(400).send({ error: 'Erro!! id não existe!' });

  const { student, subject, type, value } = newGrade;

  json.grades[oldIndex].student = student;
  json.grades[oldIndex].subject = subject;
  json.grades[oldIndex].type = type;
  json.grades[oldIndex].value = value;

  await writeFile(global.fileName, JSON.stringify(json));
  res.end();
  logger.info(`PUT /grade - ${JSON.stringify(newGrade)}`);

  try {
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`PUT /grade ${err.message}`);
  }
});

export default router;
