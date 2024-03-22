// create a web server that listens on port 3000
// when a user visits the root route, they should see a form that includes a textarea where they can type a comment
// when they submit the form, the comment should be saved to a file called comments.txt
// after the comment has been saved, redirect the user back to the root route
// when a user visits the root route, the comments should be displayed in an unordered list
// each comment should be displayed in a list item
// each comment should include a delete button
// when the delete button is clicked, the comment should be removed from the comments.txt file
// after the comment has been deleted, redirect the user back to the root route
// if the comments.txt file does not exist, it should be created                
// if the comments.txt file is empty, the root route should display a message that says "No comments yet"

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));

const commentsPath = path.join(__dirname, 'comments.txt');

app.get('/', (req, res) => {
  fs.readFile(commentsPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.send('No comments yet');
      }

      return res.send(err.message);
    }

    const comments = data.split('\n').filter(comment => comment.trim() !== '');

    if (comments.length === 0) {
      return res.send('No comments yet');
    }

    res.send(`
      <ul>
        ${comments.map(comment => `
          <li>
            ${comment}
            <form method="post" action="/delete" style="display: inline-block;">
              <input type="hidden" name="comment" value="${comment}">
              <button type="submit">Delete</button>
            </form>
          </li>
        `).join('')}
      </ul>
      <form method="post" action="/">
        <textarea name="comment"></textarea>
        <button type="submit">Add Comment</button>
      </form>
    `);
  });
});

app.post('/', (req, res) => {
  const comment = req.body.comment.trim();

  if (comment === '') {
    return res.redirect('/');
  }

  fs.appendFile(commentsPath, `${comment}\n`, err => {
    if (err) {
      return res.send(err.message);
    }

    res.redirect('/');
  });
});

app.post('/delete', (req, res) => {
  const commentToDelete = req.body.comment;

  fs.readFile(commentsPath, 'utf8', (err, data) => {
    if (err) {
      return res.send(err.message);
    }

    const comments = data.split('\n').filter(comment => comment.trim() !== '');

    const newComments = comments.filter(comment => comment !== commentToDelete);

    fs.writeFile(commentsPath, newComments.join('\n'), err => {
      if (err) {
        return res.send(err.message);
      }

      res.redirect('/');
    });
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

