
//import Head from 'next/head';
import { Inter } from 'next/font/google';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
//import EditForm from '../components/EditForm';
import { ChakraProvider, Input, Button, Flex, Box } from "@chakra-ui/react";

const inter = Inter({ subsets: ['latin'] });

type Task = {
  id: number;
  title: string;
  content: string;
  dueDate: string;
  completed: boolean;
};

const Home = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [createTask, setCreateTask] = useState({
    title: '',
    content: '',
    dueDate: '',
  });

//完了・未完了タスク
  useEffect(() => {
    fetchTasks();
  }, []);
 const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      //data.tasksから未完了と完了済のタスクをフィルタリングして条件に合致する要素で新しい配列を作る
      setTasks(data.tasks.filter((task) => !task.completed));//task.completedがtrueであるものを取り除く
      setCompletedTasks(data.tasks.filter((task) => task.completed));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

//タスクの編集
  const handleEdit = (taskId: number) => {
    //console.log(`Edit task with ID ${taskId}`);
    
  // 編集対象のタスクの特定
  const taskToEdit = tasks.find(task => task.id === taskId);
  // 見つかったタスクの編集フォームを表示する
    setEditTask(taskToEdit);//editTask状態にセット
  };
  // 編集フォームの入力値を更新する処理
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;//e.targetはイベントが発生した要素
    setEditTask(prevTask => {
      return {
      ...prevTask,//既存のeditTaskのプロパティを展開
      [name]: value,//新しい値をセット
      };
    });
  };

  // 編集フォームを閉じる処理（キャンセル）
  const handleEditCancel = () => {
    setEditTask(null);//editTask状態をクリアして閉じる
  };

  // 編集を保存する処理（サーバーに送信）
  const handleEditSave = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/tasks/${editTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(editTask),
    });

    if (!response.ok) {
      throw new Error('Failed to save edited task');
    }

  // 編集が成功したらタスク一覧を再取得して更新
    fetchTasks();

  // 編集フォームを閉じる
    setEditTask(null);

        console.log('Task edited successfully');
          } catch (error) {
        console.error('Error editing task:', error);
        }  
  };

//タスクの削除
  const handleDelete = async (taskId: number) => {
    // const confirmDelete = window.confirm('本当に削除しますか？');
    //      console.log(`Delete task with ID ${taskId}`);
    //   if (confirmDelete) {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'DELETE',
        mode: 'cors',
      });
  
      if (!response.ok) {
          throw new Error('Failed to delete task');
      }
  
  // タスク削除が成功したら再取得して更新
    fetchTasks();
      console.log('Task deleted successfully');
      } catch (error) {
      console.error('Error deleting task:', error);
      }
  };

//タスクの完了  
  const handleComplete = async (taskId: number) => {
    try {
      const response = await fetch('http://localhost:3001/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

  // タスク完了が成功したら再取得して更新
    fetchTasks();
          console.log('Task marked as completed successfully');
        } catch (error) {
          console.error('Error completing task:', error);
        }
  };

//タスクの追加（入力フィールドに変更があったときに呼び出される  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };
  //フォームが送信したときに呼び出される
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();//デフォルトのフォーム送信を防ぐ
    //console.log('New task submitted:', createTask);

    try {
      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(createTask),
      });

      if (!response.ok) {
        throw new Error('Failed to add new task');
      }

  // 新しいタスクが正常に作成された場合、タスク一覧を再取得して更新
      fetchTasks();

  // 入力フォームをリセット
      setCreateTask({
        title: '',
        content: '',
        dueDate: '',
      });

      console.log('New task added successfully');
    } catch (error) {
      console.error('Error adding new task:', error);
    }
  };

  return ( 
    <>
      
      <ChakraProvider> 
      <main className={`${styles.main} ${inter.className}`}>
       <Box> <h2 className="title" >Todo List</h2></Box>
        <h3>Let's do it！</h3>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <div>
                <Link href={`/tasks/${task.id}`}>
                  <p>{task.title}</p>
                </Link>
                <Flex >
                <Button m={1} bg={"#f5f5f5"} onClick={() => handleEdit(task.id)}>edit</Button>
                <Button m={1} bg={"#dcdcdc"} onClick={() => handleComplete(task.id)}>complete</Button>
                <Button m={1} bg={"#808080"} onClick={() => handleDelete(task.id)}>delete</Button>
                
                </Flex>
 </div>
             </li>
           ))}
          </ul>
          {/* 編集フォームの表示条件付きレンダリング */}
{editTask && (
          <div>
            <h3>Edit task</h3>
            <label>
              タイトル:
              <Input bg={"cfd4e6"}
                type="text"
                name="title"
                value={editTask.title}
                onChange={handleEditInputChange}
              />
            </label>
            <label>
              内容:
              <Input bg={"cfd4e6"}
                type="text"
                name="content"
                value={editTask.content}
                onChange={handleEditInputChange}
              />
            </label>
            <Button m={1} bg={"#f5f5f5"} onClick={handleEditSave}>save</Button>
            <Button m={1} bg={"#f5f5f5"} onClick={handleEditCancel}>cancel</Button>
          </div>
        )}


          <h3>Completed！</h3>
        <ul>
          {completedTasks.map((task) => (
            <li key={task.id}>
              <div>
                <Link href={`/tasks/${task.id}`}>
                  <p>{task.title}</p>
                </Link>
                <Button m={1} bg={"#808080"} onClick={() => handleDelete(task.id)}>delete</Button>
              </div>
            </li>
          ))}
        </ul>
               
          <form onSubmit={handleSubmit}>
           <h3>Add task</h3>
           <label>
             タイトル:
             <Input bg={"cfd4e6"}
               type="text"
               name="title"
               value={createTask.title}
               onChange={handleInputChange}
             />
           </label>
           <label>
             内容:
             <Input bg={"cfd4e6"}
               type="text"
               name="content"
               value={createTask.content}
               onChange={handleInputChange}
             />
           </label>
           <label>
             期日:
              <DatePicker 
               selected={createTask.dueDate ? new Date(createTask.dueDate) : null}
               onChange={(date) =>
                 setCreateTask((prevTask) => ({
                   ...prevTask,
                   dueDate: date ? date.toISOString() : '', // 選択した日付をISOStringに変換して格納
                }))
               }
              />
           </label>
           <Button m={1} bg={"d8bfd8"} type="submit">add task</Button>
         </form>
       
            
          
         
       </main>
       </ChakraProvider> 
       </>
   );
 };
 
 export default Home;





