import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CreateSchemaStructure = () => {
  const [schemaData, setSchemaData] = useState(null);
  const [folders, setFolders] = useState([]);
  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchedData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/schemas/get/schema/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response?.data;
        setSchemaData(data);
        if (data?.totalQuestions) {
          setFolders(generateFolders(data.totalQuestions));
        }
      } catch (error) {
        console.error("Error fetching schema data:", error);
      }
    };
    fetchedData();
  }, [id, token]);

  const generateFolders = (count) => {
    const folders = [];
    for (let i = 1; i <= count; i++) {
      folders.push({ id: i, name: `Q. ${i}`, children: [], showInputs: false });
    }
    return folders;
  };

  const handleSubQuestionsChange = (folderId, count) => {
    const numSubQuestions = parseInt(count) || 0;

    setFolders((prevFolders) =>
      prevFolders.map((folder) => {
        if (folder.id === folderId) {
          const children = Array.from({ length: numSubQuestions }, (_, i) => ({
            id: `${folderId}-${i + 1}`, // Unique ID for nested sub-questions
            name: `Q. ${folderId}.${i + 1}`,
            children: [],
          }));
          return { ...folder, children };
        }
        return folder;
      })
    );
  };

  const toggleInputsVisibility = (folderId) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId
          ? { ...folder, showInputs: !folder.showInputs }
          : folder
      )
    );
  };

  const renderFolder = (folder, level = 0, isLastChild = false) => {
    const folderStyle = `relative ml-${level * 4} mt-3`;
    const color = level % 2 === 0 ? "bg-[#f4f4f4]" : "bg-[#fafafa]";

    return (
      <div
        className={`${folderStyle} p-4 ${color} rounded shadow `}
        key={folder.id}
      >
        {/* Curved Vertical Line */}
        {level > 0 && (
          <div
            className={`absolute left-[-16px] top-[-16px] ${
              isLastChild ? "h-1/2" : "h-full"
            } w-[2px] rounded-[12px] border-l-2 border-[#8a8a8a] bg-gradient-to-b from-gray-400 to-gray-500`}
          ></div>
        )}

        {/* Horizontal Connector */}
        {level > 0 && (
          <div className="absolute left-[-16px] top-[16px] h-[2px] w-4 rounded-md bg-gradient-to-r from-gray-400 to-gray-500"></div>
        )}

        {/* Folder Header */}
        <div className="flex items-center gap-2">
          <span className="text-black-500 font-semibold">📁 {folder.name}</span>

          {/* Marks Input Fields */}
          <input
            type="text"
            placeholder="Min Marks"
            className="ml-2 rounded border px-3 py-1 text-center text-sm"
          />
          <input
            type="text"
            placeholder="Max Marks"
            className="ml-2 rounded border px-3 py-1 text-center text-sm"
          />
          <input
            type="text"
            placeholder="Bonus Marks"
            className="ml-2 rounded border px-3 py-1 text-center text-sm"
          />
          <input
            type="text"
            placeholder="Marks Difference"
            className="ml-2 rounded border px-3 py-1 text-center text-sm"
          />
          <input
            type="checkbox"
            className="ml-2 cursor-pointer"
            onChange={() => toggleInputsVisibility(folder.id)}
          />
          <label className="text-sm font-medium text-gray-700">
            Sub Questions
          </label>

          {/* Conditional Inputs */}
          {folder.showInputs && (
            <>
              <input
                type="number"
                placeholder="No. of Sub-Questions"
                className="rounded border px-3 py-1 text-sm"
                onChange={(e) =>
                  handleSubQuestionsChange(folder.id, e.target.value)
                }
              />
              <input
                type="text"
                placeholder="No. of Compulsory Sub-Questions"
                className="rounded border px-3 py-1 text-sm"
                
              />
            </>
          )}
          <button className="font-md rounded-lg border-2 border-gray-900 bg-blue-800 px-3 text-white">
            Save
          </button>
        </div>

        {/* Render Children */}
        <div className="relative ml-4 mt-4">
          {folder.children.map((child, index) =>
            renderFolder(
              child,
              level + 1,
              index === folder.children.length - 1 // Check if it's the last child
            )
          )}
        </div>
      </div>
    );
  };

  if (!schemaData) {
    return <div>Loading schema data...</div>;
  }

  return (
    <div className="custom-scrollbar min-h-screen bg-gray-100 p-6">
      <div className="max-h-[75vh] space-y-4 overflow-y-scroll rounded-lg border border-gray-300 p-4">
        {folders.map((folder) => renderFolder(folder))}
      </div>
    </div>
  );
};

export default CreateSchemaStructure;
