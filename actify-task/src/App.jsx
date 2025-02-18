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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = dummyData;
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
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="mb-4 bg-slate-500 text-white p-4 text-center font-bold text-2xl rounded-md">
        User Details
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-4 border rounded-md bg-white shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input {...register("firstName", { required: "First Name is required" })} placeholder="First Name" className="p-2 border rounded w-full" />
          <input {...register("lastName", { required: "Last Name is required" })} placeholder="Last Name" className="p-2 border rounded w-full" />
          <input {...register("email", { required: "Email is required" })} placeholder="Email" className="p-2 border rounded w-full" />
          <select {...register("gender", { required: "Gender is required" })} className="p-2 border rounded w-full">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input {...register("age", { required: "Age is required" })} placeholder="Age" type="number" className="p-2 border rounded w-full" />
          <input {...register("city", { required: "City is required" })} placeholder="City" className="p-2 border rounded w-full" />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full">Submit</button>
      </form>
      
      <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => dispatch(setSearchTerm(e.target.value))} className="p-2 border rounded w-full mt-4" />
      
      <button onClick={exportToExcel} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Download Excel</button>
      
      <div className="overflow-x-auto mt-4">
        <table className="w-full border text-left text-sm md:text-base">
          <thead>
            <tr>
              <th onClick={() => requestSort("id")} className="p-2 border cursor-pointer">ID</th>
              <th onClick={() => requestSort("firstName")} className="p-2 border cursor-pointer">Name</th>
              <th onClick={() => requestSort("email")} className="p-2 border cursor-pointer">Email</th>
              <th onClick={() => requestSort("gender")} className="p-2 border cursor-pointer">Gender</th>
              <th onClick={() => requestSort("age")} className="p-2 border cursor-pointer">Age</th>
              <th onClick={() => requestSort("city")} className="p-2 border cursor-pointer">City</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((data) => (
              <tr key={data.id} className="text-center">
                <td className="p-2 border">{data.id}</td>
                <td className="p-2 border">{data.firstName} {data.lastName}</td>
                <td className="p-2 border">{data.email}</td>
                <td className="p-2 border">{data.gender}</td>
                <td className="p-2 border">{data.age}</td>
                <td className="p-2 border">{data.city}</td>
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
    </div>
  );
};

export default App;
