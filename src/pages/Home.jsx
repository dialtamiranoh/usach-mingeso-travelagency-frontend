// pages/Home.jsx
import BookingTable from '../components/BookingTable'

const Home = () => {
    return (
        <div className="container mt-4">
            <h1>TravelAgency</h1>
            <BookingTable isAdmin={true} />
        </div>
    )
}

export default Home