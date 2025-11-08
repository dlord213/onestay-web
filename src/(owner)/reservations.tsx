/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { roomAPI, type Room } from "../api/room";
import { reservationAPI } from "../api/reservation";
import { useNavigate } from "react-router";
import { useResortStore } from "./store/resort";
import Sidebar from "./components/sidebar";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function ReservationScreen() {
  const navigate = useNavigate();
  const { resorts } = useResortStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [rooms, setRooms] = useState<Room[] | null>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<Value>([null, null]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);

  useEffect(() => {
    const getRooms = async () => {
      if (!resorts || resorts.length === 0) {
        return;
      }
      setIsLoadingRooms(true);
      try {
        const { rooms } = await roomAPI.getRoomsByResort(resorts[0]._id);
        setRooms(rooms);
        if (rooms && rooms.length > 0) {
          setSelectedRoomId(rooms[0]._id);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    getRooms();
  }, [resorts]);

  useEffect(() => {
    const getBookedDates = async () => {
      if (!selectedRoomId) {
        setBookedDates([]);
        return;
      }
      setIsLoadingBookedDates(true);
      setBookedDates([]);
      try {
        const bookedDatesData = await reservationAPI.getBookedDates(
          selectedRoomId
        );
        setBookedDates(bookedDatesData.booked_dates || []);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
        setBookedDates([]);
      } finally {
        setIsLoadingBookedDates(false);
      }
    };

    getBookedDates();
  }, [selectedRoomId]); // This is the key: re-run when the room changes

  const isDateDisabled = ({ date }: { date: Date }): boolean => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateString = `${yyyy}-${mm}-${dd}`;

    return bookedDates.includes(dateString);
  };

  const getTileClassName = ({ date }: { date: Date }): string | null => {
    if (isDateDisabled({ date })) {
      return "booked-date"; // This is our custom CSS class
    }
    return null;
  };

  const handleReserve = async () => {
    if (
      !name ||
      !email ||
      !contactNumber ||
      !selectedRoomId ||
      !Array.isArray(selectedRange) ||
      !selectedRange[0] ||
      !selectedRange[1]
    ) {
      alert("Please fill all fields and select a valid date range.");
      return;
    }

    const [checkInDate, checkOutDate] = selectedRange;

    try {
      const reservationDetails = {
        resortId: resorts[0]._id,
        roomId: selectedRoomId,
        checkInDate: checkInDate.toISOString().split("T")[0],
        checkOutDate: checkOutDate.toISOString().split("T")[0],
        guestDetails: {
          name,
          email,
          contactNumber,
        },
        // The API should calculate total_price, nights, etc., on the backend
      };

      console.log("Creating reservation:", reservationDetails);

      await reservationAPI.createReservation(reservationDetails);

      alert("Reservation created successfully!");
      navigate("/dashboard"); // Or wherever you want to go
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert(`Failed to create reservation: ${error.message}`);
    }
  };

  return (
    <main className="grid grid-cols-[0.2fr_1fr]">
      <Sidebar />
      <div className="flex flex-col gap-6 p-12">
        <h1 className="lg:text-4xl font-bold">Create Reservation</h1>
        <div className="grid grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4 bg-base-200 p-6 rounded-xl">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Full name</legend>
              <input
                type="text"
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input
                type="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Contact Number</legend>
              <input
                type="tel"
                className="input w-full"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Rooms</legend>
              <select
                className="select w-full"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={isLoadingRooms}
              >
                {isLoadingRooms && <option>Loading rooms...</option>}
                {rooms?.map((room) => (
                  <option
                    key={room._id}
                    value={room._id}
                    disabled={room.status !== "available"}
                  >
                    {room.room_type} (Status: {room.status})
                  </option>
                ))}
              </select>
            </fieldset>
          </div>

          {/* Calendar */}
          <div>
            <Calendar
              onChange={setSelectedRange}
              value={selectedRange}
              selectRange={true}
              minDate={new Date()}
              tileDisabled={isDateDisabled}
              tileClassName={getTileClassName}
              showNavigation
            />
            {isLoadingBookedDates && (
              <p className="text-center mt-4 text-gray-500">
                Loading booked dates...
              </p>
            )}

            <div className="px-1 py-3 flex flex-row flex-wrap gap-4">
              <div className="flex flex-row items-center">
                <div className="w-3 h-3 bg-gray-800 rounded mr-2" />
                <span className="text-xs text-gray-600">Selected</span>
              </div>
              <div className="flex flex-row items-center">
                <div className="w-3 h-3 bg-red-200 rounded mr-2" />
                <span className="text-xs text-gray-600">Booked</span>
              </div>
              <div className="flex flex-row items-center">
                <div className="w-3 h-3 bg-gray-100 rounded mr-2" />
                <span className="text-xs text-gray-600">In range</span>
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-neutral" onClick={handleReserve}>
          Create Reservation
        </button>
      </div>
    </main>
  );
}
