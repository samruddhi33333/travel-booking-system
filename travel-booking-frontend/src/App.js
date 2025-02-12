import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "./App.css";

// ✅ GraphQL Queries & Mutations
const GET_BOOKINGS = gql`
  query {
    bookings {
      id
      name
      destination
      date
      price
    }
  }
`;

const ADD_BOOKING = gql`
  mutation addBooking($name: String!, $destination: String!, $date: String!, $price: Float!) {
    addBooking(name: $name, destination: $destination, date: $date, price: $price) {
      id
      name
      destination
      date
      price
    }
  }
`;

const DELETE_BOOKING = gql`
  mutation deleteBooking($id: ID!) {
    deleteBooking(id: $id)
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_BOOKINGS);
  const [addBooking, { loading: adding }] = useMutation(ADD_BOOKING, {
    update(cache, { data: { addBooking } }) {
      const existingBookings = cache.readQuery({ query: GET_BOOKINGS }) || { bookings: [] };
      cache.writeQuery({
        query: GET_BOOKINGS,
        data: { bookings: [...existingBookings.bookings, addBooking] },
      });
    },
  });

  const [deleteBooking] = useMutation(DELETE_BOOKING, {
    update(cache, { data: { deleteBooking } }) {
      const existingBookings = cache.readQuery({ query: GET_BOOKINGS }) || { bookings: [] };
      cache.writeQuery({
        query: GET_BOOKINGS,
        data: { bookings: existingBookings.bookings.filter((b) => b.id !== deleteBooking) },
      });
    },
    refetchQueries: [{ query: GET_BOOKINGS }], // Ensure UI updates
  });

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");

  const handleAddBooking = async () => {
    if (!name || !destination || !date || !price) {
      alert("All fields are required");
      return;
    }
    try {
      await addBooking({ variables: { name, destination, date, price: parseFloat(price) } });
      setName("");
      setDestination("");
      setDate("");
      setPrice("");
    } catch (err) {
      alert("Error adding booking: " + err.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await deleteBooking({ variables: { id } });
    } catch (err) {
      alert("Error deleting booking: " + err.message);
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error loading bookings.</p>;

  return (
    <div className="container">
      <h2>Travel Booking Management</h2>

      {/* Add Booking Form */}
      <div className="form-container">
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button onClick={handleAddBooking} disabled={adding} className="add-button">
          {adding ? "Adding..." : "Add Booking"}
        </button>
      </div>

      {/* Booking List */}
      <h3>Bookings:</h3>
      <ul className="booking-list">
        {data.bookings.map((booking) => (
          <li key={booking.id} className="booking-item">
            <span>{booking.name} - {booking.destination} - {booking.date} - ${booking.price}</span>
            <button onClick={() => handleDeleteBooking(booking.id)} className="delete-button">❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
