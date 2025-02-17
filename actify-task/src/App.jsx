import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsers,
  setCurrentPage,
  setSearchTerm,
  setSortConfig,
} from "./userSlice";
import axios from "axios";
import * as XLSX from "xlsx";
import { useForm } from "react-hook-form";
import { dummyData } from "./dummyData";

const App = () => {
  const dispatch = useDispatch();
  const { users, currentPage, searchTerm, sortConfig } = useSelector(
    (state) => state.user
  );
  const usersPerPage = 10;
  // const api = "https://dummyjson.com/users";
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axios.get(api);
        // const data = response.data.users;
        const data = dummyData;
        console.log(data);
        
        dispatch(setUsers(data));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [dispatch]);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    dispatch(setSortConfig({ key, direction }));
  };

  const filteredUsers = sortedUsers.filter(
    (data) =>
      data.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.age.toString().includes(searchTerm) ||
      data.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredUsers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "UsersData.xlsx");
  };

  const onSubmit = (data) => {
    dispatch(setUsers([...users, { id: users.length + 1, ...data }]));
    reset();
  };
  return (
    <div>
      <div>
        <div className="p-4 max-w-full overflow-x-auto">
          <h1 className="mb-4 bg-slate-500 text-white p-2 text-center font-bold text-2xl">
            User Details
          </h1>

          {/* User Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-4 p-4 border rounded"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                {...register("firstName", {
                  required: "First Name is required",
                })}
                placeholder="First Name"
                className="p-2 border rounded"
              />
              {errors.firstName && (
                <span className="text-red-500">{errors.firstName.message}</span>
              )}

              <input
                {...register("lastName", { required: "Last Name is required" })}
                placeholder="Last Name"
                className="p-2 border rounded"
              />
              {errors.lastName && (
                <span className="text-red-500">{errors.lastName.message}</span>
              )}

              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@]+@[^@]+\.[^@]+$/,
                    message: "Invalid email",
                  },
                })}
                placeholder="Email"
                className="p-2 border rounded"
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}

              <select
                {...register("gender", { required: "Gender is required" })}
                className="p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <span className="text-red-500">{errors.gender.message}</span>
              )}

              <input
                {...register("age", {
                  required: "Age is required",
                  min: { value: 1, message: "Age must be positive" },
                })}
                placeholder="Age"
                type="number"
                className="p-2 border rounded"
              />
              {errors.age && (
                <span className="text-red-500">{errors.age.message}</span>
              )}

              <input
                {...register("city", { required: "City is required" })}
                placeholder="City"
                className="p-2 border rounded"
              />
              {errors.city && (
                <span className="text-red-500">
                  {errors.city.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        className="p-2 border border-gray-300 rounded mb-4 w-full"
      />

      <button
        onClick={exportToExcel}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Download Excel
      </button>
      <table className="border-2 border-separate border border-slate-400 w-full text-sm md:text-base">
        <thead>
          <tr>
            <th
              className="border border-slate-300 p-2"
              onClick={() => requestSort("id")}
            >
              ID
            </th>
            <th
              className="border border-slate-300 p-2"
              onClick={() => requestSort("firstName")}
            >
              Name
            </th>
            <th
              className="border border-slate-300 p-2"
              onClick={() => requestSort("email")}
            >
              Email
            </th>
            <th
              className="border border-slate-300 p-2"
              onClick={() => requestSort("gender")}
            >
              Gender
            </th>
            <th
              className="border border-slate-300 p-2"
              onClick={() => requestSort("age")}
            >
              Age
            </th>
            <th
              className="border border-slate-300 p-2"
              onClick={() => requestSort("city")}
            >
              City
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((data) => (
            <tr key={data.id}>
              <td className="border border-slate-300 p-2 text-center">
                {data.id}
              </td>
              <td className="border border-slate-300 p-2 text-center">
                {data.firstName} {data.lastName}
              </td>
              <td className="border border-slate-300 p-2 text-center">
                {data.email}
              </td>
              <td className="border border-slate-300 p-2 text-center">
                {data.gender}
              </td>
              <td className="border border-slate-300 p-2 text-center">
                {data.age}
              </td>
              <td className="border border-slate-300 p-2 text-center">
                {data.city}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center items-center gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          {" "}
          Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}{" "}
        </span>
        <button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredUsers.length / usersPerPage)
          }
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default App;
