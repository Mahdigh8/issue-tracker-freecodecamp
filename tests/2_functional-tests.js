/* eslint-disable no-undef */
const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');
const Project = require('../models/project');
const Issue = require('../models/issue');

chai.use(chaiHttp);

async function cleanUpDatabase() {
  console.log('Cleaning up database ...');
  const project = await Project.findOne({ name: 'apitest' });
  if (!project) return;
  await Issue.deleteMany({ project_id: project._id });
  await Project.deleteOne({ name: 'apitest' });
}

suite('Functional Tests', () => {
  let issueIdToDelete;
  suite('Create an Issue', () => {
    test('Create an issue with every field', (done) => {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .set('content-type', 'application/json')
        .send({
          issue_title: 'Issue1',
          issue_text: 'FunctionalTest1',
          created_by: 'fCC',
          assigned_to: 'Dom',
          status_text: 'Not Done',
        })
        .end((err, res) => {
          assert.equal(res.status, 201);
          issueIdToDelete = res.body._id;
          assert.equal(res.body.issue_title, 'Issue1');
          assert.equal(res.body.assigned_to, 'Dom');
          assert.equal(res.body.created_by, 'fCC');
          assert.equal(res.body.status_text, 'Not Done');
          assert.equal(res.body.issue_text, 'FunctionalTest1');
          done();
        });
    });
    test('Create an issue with only required fields', (done) => {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .set('content-type', 'application/json')
        .send({
          issue_title: 'Issue2',
          issue_text: 'FunctionalTest2',
          created_by: 'fCC',
        })
        .end((err, res) => {
          assert.equal(res.status, 201);
          assert.equal(res.body.issue_title, 'Issue2');
          assert.equal(res.body.issue_text, 'FunctionalTest2');
          assert.equal(res.body.created_by, 'fCC');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });
    test('Create an issue with missing required fields', (done) => {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .set('content-type', 'application/json')
        .send({
          issue_title: 'Issue',
          created_by: 'fCC',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('View Issues', () => {
    test('View issues on a project', (done) => {
      chai
        .request(server)
        .get('/api/issues/test-get')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 2);
          done();
        });
    });
    test('View issues on a project with one filter', (done) => {
      chai
        .request(server)
        .get('/api/issues/test-get')
        .query({
          issue_title: 'Hey',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 1);
          assert.deepEqual(res.body[0], {
            issue_title: 'Hey',
            issue_text: 'some text',
            created_by: 'Landon',
            assigned_to: '',
            status_text: '',
            created_on: '2022-10-25T20:58:11.101Z',
            updated_on: '2022-10-25T20:58:11.101Z',
            open: true,
            _id: '63584e5d929295fbc8dbeb7f',
          });
          done();
        });
    });
    test('View issues on a project with multiple filters', (done) => {
      chai
        .request(server)
        .get('/api/issues/test-get')
        .query({
          issue_title: 'HOOOYY',
          issue_text: 'some text',
          created_by: 'NYC',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 1);
          assert.deepEqual(res.body[0], {
            issue_title: 'HOOOYY',
            issue_text: 'some text',
            created_by: 'NYC',
            assigned_to: 'NYC',
            status_text: '',
            created_on: '2022-10-25T21:00:47.230Z',
            updated_on: '2022-10-25T21:00:47.230Z',
            open: true,
            _id: '63584ef157def9b013a73598',
          });
          done();
        });
    });
  });

  suite('Update an Issue', () => {
    test('Update one field on an issue', (done) => {
      chai
        .request(server)
        .put('/api/issues/test-put')
        .send({
          _id: '635852189a93ce00552d393a',
          issue_title: 'different',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '635852189a93ce00552d393a');
          done();
        });
    });
    test('Update multiple fields on an issue', (done) => {
      chai
        .request(server)
        .put('/api/issues/test-put')
        .send({
          _id: '635852189a93ce00552d393a',
          issue_title: 'random',
          issue_text: 'random',
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '635852189a93ce00552d393a');
          done();
        });
    });
    test('Update an issue with missing _id', (done) => {
      chai
        .request(server)
        .put('/api/issues/test-put')
        .send({
          issue_title: 'update',
          issue_text: 'update',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    test('Update an issue with no fields to update', (done) => {
      chai
        .request(server)
        .put('/api/issues/test-put')
        .send({
          _id: '635852189a93ce00552d393a',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });
    test('Update an issue with an invalid _id', (done) => {
      chai
        .request(server)
        .put('/api/issues/test-put')
        .send({
          _id: '635852189a93ce0055invalid',
          issue_title: 'update',
          issue_text: 'update',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('Delete an Issue', () => {
    test('Delete an issue DELETE request', (done) => {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: issueIdToDelete,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });
    test('Delete an issue with an invalid _id', (done) => {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: '5fe0c500ec2f6f4c1815a770invalid',
        })
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });
    test('Delete an issue with missing _id', (done) => {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});

// cleanUpDatabase()
//   .then(() => console.log('Done.'))
//   .catch((err) => console.log(err));
