import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import Confetti from 'react-confetti';
import Footer from '@/components/Footer'; 
import { addPendingPoints } from '@/utils/pendingPoints';
import SubHeader from '@/components/SubHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Suspense, lazy } from 'react';
const ErrorModal = lazy(() => import('@/components/ErrorModal'));
const SuccessModal = lazy(() => import('@/components/SuccessModal'));

interface TaskPageProps {
  theme: 'light' | 'dark';
}

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  task_source: string;
  task_link: any;
  verification_code: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const TaskList: React.FC<TaskPageProps> = ({ theme }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [taskStarted, setTaskStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); 
  const userId = Cookies.get('userId');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUncompletedTasks = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/uncompleted?userId=${userId}`);
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
    }
  }, [userId]);

  useEffect(() => {
    const fetchInterval = setInterval(fetchUncompletedTasks, 100000); 
    fetchUncompletedTasks();
    return () => clearInterval(fetchInterval);
  }, [userId, fetchUncompletedTasks]);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setTaskStarted(false);
    setIsModalOpen(true);
    setEnteredCode('');
    setIsVerifying(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setShowConfetti(false);
    setIsVerifying(false);
  };

  const startTask = (taskUrl: string) => {
    window.open(taskUrl, '_blank');
    setTaskStarted(true);
  };

  const verifyTask = async () => {
    if (selectedTask && enteredCode.trim().toLowerCase() === selectedTask.verification_code.trim().toLowerCase()) {
      setIsVerifying(true);
      try {
        addPendingPoints(userId, selectedTask.points);
        setShowConfetti(true);

        const response = await fetch(`${apiUrl}/api/tasks/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            taskId: selectedTask.id,
          }),
        });

        if (response.ok) {
          setSuccessMessage('Task verified! Points added.');
          fetchUncompletedTasks();
          closeModal();
        } else {
          // handle error
        }
      } catch (error) {
        // handle error
      } finally {
        setIsVerifying(false);
      }
    } else {
      setErrorMessage('Incorrect verification code. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className={`${isModalOpen ? 'blur-background' : ''}`}>
        <SubHeader title="Figo Tasks" />

        <div className="overflow-y-auto mt-6"> 
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-4 mb-4 bg-gray-800 rounded-full shadow-md">
            <div className="flex items-center space-x-4">
              <Image src={`/icons/${task.task_source}.png`} alt={task.task_source} width={40} height={40} />
              <div>
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <p className="text-sm font-bold text-purple-500">+{task.points} FP</p>
              </div>
            </div>
            <button onClick={() => openModal(task)} className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
              Open
            </button>
          </div>
        ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-black p-6 rounded-lg w-full max-w-lg shadow-lg">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" style={{ fontSize: '36px' }} />
            </button>
            <div className="flex flex-col items-center justify-center">
              <Image src={`/icons/${selectedTask.task_source}.png`} alt={selectedTask.task_source} width={90} height={90} />
              <h3 className="text-3xl font-bold mb-4 text-purple-500 mt-8">{selectedTask.title}</h3>
              <p className="mb-8 text-white">{selectedTask.description}</p>
              <div className="mb-8 text-5xl text-purple-500 font-extrabold"> +{selectedTask.points} FP</div>
              {!taskStarted ? (
                <button onClick={() => startTask(selectedTask.task_link)} className="w-3/4 bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-green-600 mb-16">
                  Start Task
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="Enter Verification Code"
                    className="border p-2 w-full mb-4 text-center"
                  />
                  <button onClick={verifyTask} className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600" disabled={isVerifying}>
                    {isVerifying ? 'Verifying...' : 'Verify Task'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <Suspense fallback={<div>Loading...</div>}>
  <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
  <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
  </Suspense>
      {showConfetti && <Confetti />}
      <Footer theme={theme} />
    </div>
  );
};

export default TaskList;



