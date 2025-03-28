import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  VolunteerData,
} from "../services/volunteerService";
import Sidebar from "./Sidebar";

const VolunteerRequests: React.FC = () => {
  const [pendingVolunteers, setPendingVolunteers] = useState<VolunteerData[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // For navigation

  // Fetch pending volunteers on component mount
  useEffect(() => {
    const getPendingVolunteers = async () => {
      try {
        const volunteers = await fetchPendingVolunteers();
        setPendingVolunteers(volunteers);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pending volunteers.");
        setLoading(false);
      }
    };

    getPendingVolunteers();
  }, []);

  const handleApprove = async (volunteer: VolunteerData) => {
    if (!volunteer._id) {
      setError("Volunteer ID is missing.");
      return;
    }

    const volunteerId = volunteer._id;
    try {
      await approveVolunteer(volunteerId);
      setPendingVolunteers(
        pendingVolunteers.filter((v) => v._id !== volunteerId)
      );
    } catch (error) {
      setError("Failed to approve volunteer.");
    }
  };

  const handleReject = async (volunteerId: string) => {
    try {
      await rejectVolunteer(volunteerId);
      setPendingVolunteers(
        pendingVolunteers.filter((v) => v.userId !== volunteerId)
      );
    } catch (error) {
      setError("Failed to reject volunteer.");
    }
  };

  const handleBack = () => {
    navigate("/volunteer-management"); // Navigate to the volunteer management page
  };

  if (loading) {
    return <p>Loading pending requests...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-8">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
        >
          Back to Volunteer Management
        </button>

        <h2 className="text-2xl font-bold mb-6">Pending Volunteer Requests</h2>

        {/* Display a message if there are no pending requests */}
        {pendingVolunteers.length === 0 ? (
          <h3 className="text-center text-xl font-semibold text-gray-500">
            No requests
          </h3>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-100 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                    Profile Picture
                  </th>
                  <th className="px-6 py-3 bg-gray-100 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-gray-100 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-100 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                    Skills
                  </th>
                  <th className="px-6 py-3 bg-gray-100 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                    Experience
                  </th>
                  <th className="px-6 py-3 bg-gray-100 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingVolunteers.map((volunteer) => (
                  <tr key={volunteer.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">
                      <img
                        src={volunteer.profilePicture}
                        alt={`${volunteer.name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">
                      {volunteer.name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">
                      {volunteer.email}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">
                      {volunteer.skills.join(", ")}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700">
                      {volunteer.experience} years
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300 text-sm text-gray-700 space-x-4">
                      <button
                        onClick={() => handleApprove(volunteer)}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (!volunteer._id) {
                            setError("Volunteer ID is missing.");
                            return;
                          }
                          handleReject(volunteer._id);
                        }}
                        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-200"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerRequests;
