import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {
  const authState = useSelector(state => state.authReducer);
  const [allTasks, setAllTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [fetchData, { loading }] = useFetch();
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByPriority, setSortByPriority] = useState('none'); // 'none', 'ascending', 'descending'
  const [sortByDueDate, setSortByDueDate] = useState('none'); // 'none', 'ascending', 'descending'

  const fetchTasks = useCallback(() => {
    fetchData({ url: "/tasks", method: "get", headers: { Authorization: authState.token } })
      .then(data => {
        setAllTasks(data.tasks);
        setPendingTasks(data.tasks.filter(task => !task.completed));
        setCompletedTasks(data.tasks.filter(task => task.completed));
      })
      .catch(error => console.error("Error fetching tasks:", error));
  }, [authState.token, fetchData]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  const handleDelete = (id) => {
    const config = { url: `/tasks/${id}`, method: "delete", headers: { Authorization: authState.token } };
    fetchData(config)
      .then(() => fetchTasks())
      .catch(error => console.error("Error deleting task:", error));
  };

  const handleCheckStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`https://my-task-manager-ns00.onrender.com/api/tasks/${id}`, {
        method: 'post',
        headers: { "Content-Type": "application/json", "accept": "application/json", Authorization: authState.token },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (res.ok) {
        fetchTasks();
      } else {
        console.error("Error updating task status:", res.statusText);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  let tasksToDisplay = [];
  if (filter === 'pending') {
    tasksToDisplay = pendingTasks;
  } else if (filter === 'completed') {
    tasksToDisplay = completedTasks;
  } else {
    tasksToDisplay = allTasks;
  }

  // Apply search filter
  if (searchQuery) {
    tasksToDisplay = tasksToDisplay.filter(task =>
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sorting based on priority
  if (sortByPriority === 'ascending') {
    tasksToDisplay.sort((a, b) => {
      // Convert priority to string before comparison
      const priorityA = String(a.priority);
      const priorityB = String(b.priority);
      return priorityA.localeCompare(priorityB);
    });
  } else if (sortByPriority === 'descending') {
    tasksToDisplay.sort((a, b) => {
      // Convert priority to string before comparison
      const priorityA = String(a.priority);
      const priorityB = String(b.priority);
      return priorityB.localeCompare(priorityA);
    });
  }

  // Sorting based on due date only if not sorted by priority
  if (sortByDueDate !== 'none' && sortByPriority === 'none') {
    if (sortByDueDate === 'ascending') {
      tasksToDisplay.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortByDueDate === 'descending') {
      tasksToDisplay.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    }
  }


  return (
    <div key="tasks-container">
      <div className="my-2 mx-auto max-w-[700px] py-4">
        <div className="flex justify-center gap-4 mb-4">
          <button className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('pending')}>Pending</button>
          <button className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-between mb-4">
          <div>
            <label htmlFor="priority-sort">Sort by Priority:</label>
            <select id="priority-sort" value={sortByPriority} onChange={e => setSortByPriority(e.target.value)}>
              <option value="none">None</option>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>
          <div>
            <label htmlFor="due-date-sort">Sort by Due Date:</label>
            <select id="due-date-sort" value={sortByDueDate} onChange={e => setSortByDueDate(e.target.value)}>
              <option value="none">None</option>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div>
            {tasksToDisplay.length === 0 ? (
              <div className='w-[600px] h-[300px] flex items-center justify-center gap-4'>
                <span>No tasks found</span>
                <Link to="/tasks/add" className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2">+ Add new task </Link>
              </div>
            ) : (
              tasksToDisplay.map((task, index) => (
                <div key={task._id} className='bg-white my-4 p-4 text-gray-600 rounded-md shadow-md'>
                  <div className='flex'>
                    <span className='font-medium'>Task #{index + 1}</span>
                    <Tooltip text={"Mark/Unmark Checked"} position={"top"}>
                      <button className="ml-2 text-green-600 cursor-pointer" onClick={() => handleCheckStatus(task._id, task.completed)}>
                        {task.completed ? <i className="fa-solid fa-check-square"></i> : <i className="fa-solid fa-square"></i>}
                      </button>
                    </Tooltip>
                    <Tooltip text={"Edit this task"} position={"top"}>
                      <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-600 cursor-pointer'>
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                    </Tooltip>
                    <Tooltip text={"Delete this task"} position={"top"}>
                      <span className='text-red-500 cursor-pointer' onClick={() => handleDelete(task._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </span>
                    </Tooltip>
                  </div>
                  <div className='whitespace-pre'>{task.description}</div>
                  <div className='text-sm mt-2'>
                    Priority: {task.priority}
                    <br />
                    Due Date: {task.dueDate.substring(0, 10)} {/* Extracting only the date part */}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
