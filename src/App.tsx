/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
/*if (!USER_ID) {
    return <UserWarning />;
  } */

import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import cn from 'classnames';
import { SORTFIELD } from './types/SortField';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const allTodosAreDone = todos.every(t => t.completed);
  const someTodosAreDone = todos.some(t => t.completed);
  const numberOfDoneTodos = todos.filter(t => !t.completed);

  const [error, setError] = useState(false);

  const [getError, setGetError] = useState(false);
  const [deleteError] = useState(false);
  const [patchError] = useState(false);
  const [postError] = useState(false);

  //const [title, setTitle] = useState('');
  const [titleError] = useState(false);

  const [isEditing] = useState<number | null>();
  const [isUploading] = useState<number | null>();
  const [isDeleting] = useState<number | null>();

  const [sortField, setSortField] = useState<SORTFIELD>(SORTFIELD.ALL);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setError(true);
        setGetError(true);

        setTimeout(() => {
          setError(false);
        }, 3000);
      });
  }, []);

  function getPreparedTodos(items: Todo[], sortType: SORTFIELD) {
    let preparedTodos = [...items];

    if (sortType === SORTFIELD.ACTIVE) {
      preparedTodos = preparedTodos.filter(t => !t.completed);
    } else if (sortType === SORTFIELD.COMPLETED) {
      preparedTodos = preparedTodos.filter(t => t.completed);
    }

    return preparedTodos;
  }

  const visibleTodos = getPreparedTodos(todos, sortField);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={cn('todoapp__toggle-all', { active: allTodosAreDone })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              autoFocus
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => (
            <div
              key={todo.id}
              data-cy="Todo"
              className={cn('todo', { completed: todo.completed })}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                />
              </label>
              {!isEditing ? (
                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>
              ) : isEditing === todo.id ? (
                <form>
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    value="Todo is being edited now"
                  />
                </form>
              ) : (
                ''
              )}

              {/* Remove button appears only on hover */}
              {isEditing === todo.id || (
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>
              )}

              <div data-cy="TodoLoader" className="modal overlay">
                <div
                  className={cn('modal-background has-background-white-ter', {
                    'is-active':
                      isDeleting == todo.id || isUploading === todo.id,
                  })}
                />
                <div className="loader" />
              </div>
            </div>
          ))}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {numberOfDoneTodos.length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={cn('filter__link', {
                  selected: sortField === SORTFIELD.ALL,
                })}
                data-cy="FilterLinkAll"
                onClick={() => setSortField(SORTFIELD.ALL)}
              >
                All
              </a>

              <a
                href="#/active"
                className={cn('filter__link', {
                  selected: sortField === SORTFIELD.ACTIVE,
                })}
                data-cy="FilterLinkActive"
                onClick={() => setSortField(SORTFIELD.ACTIVE)}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={cn('filter__link', {
                  selected: sortField === SORTFIELD.COMPLETED,
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setSortField(SORTFIELD.COMPLETED)}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={!someTodosAreDone}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !error },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError(false)}
        />
        {/* show only one message at a time */}
        {getError && <p>Unable to load todos</p>}
        {titleError && <p>Title should not be empty</p>}
        {postError && <p>Unable to add a todo</p>}
        {deleteError && <p>Unable to delete a todo</p>}
        {patchError && <p>Unable to update a todo</p>}
      </div>
    </div>
  );
};
