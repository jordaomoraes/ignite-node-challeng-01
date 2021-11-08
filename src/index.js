const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {

  // aqui é  middleware, que pega o username vindo no headers
  const {username} = request.headers;

  const user = users.find(user=>user.username === username)

  if(!user){
    return response.status(404).json({error:" User not find"})
  }

  request.user = user;
  return next();
  
}

app.post('/users', (request, response) => {

  const {name, username} = request.body;


  const userExists = users.find(user =>user.username === username);

  if(userExists){

return response.status(400).json({error : "Nome do Usuário Já Cadastrado"})


  }

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }
 users.push(user);

 return response.status(201).json(user)


});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const { title, deadline } = request.body;
  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return  response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  //verifica se dentro do user e dento do ToDo tem o Todo que está sendo editado.
  const todo = user.todos.find(todo =>todo.id === id);

  if(!todo) {

      return response.status(404).json({error : "Todo not Found"})

  }

  todo.title = title;
  todo.deadline = new Date(deadline)

  return response.json (todo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const { id } = request.params;

  const todo = user.todos.find(todo =>todo.id === id);
  if(!todo) {

    return response.status(404).json({error : "Todo not Found"})

}
 todo.done = true;
  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const {user} = request;
  const { id } = request.params;

  //find Index retorna a posição no array
  const todoIndex = user.todos.findIndex(todo =>todo.id === id);

  if(todoIndex === -1) {
    return response.status(404).json({error : "Todo not Found"})
}

//primeiro argumento do splice é a posição inicial, a segunda é a quantidade depois da posicao
user.todos.splice(todoIndex,1);

return response.status(204).json();
 
});

module.exports = app;