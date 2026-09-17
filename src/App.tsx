import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import AppLayout from "./layouts/AppLayout";
import TicketDetails from "./pages/TicketDetails";
import NewTicket from "./pages/NewTicket";

type Page =
  | "dashboard"
  | "tickets"
  | "ticket-details"
  | "new-ticket";


function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("resolvedesk_token"))
  );

  const [selectedTicketId, setSelectedTicketId] =
    useState<number | null>(null);

  const [page, setPage] = useState<Page>("dashboard");

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => {
          setLoggedIn(true);
          setPage("dashboard");
        }}
      />
    );
  }

  return (
    <AppLayout
      page={page}
      onNavigate={setPage}
      onLogout={() => {
        setLoggedIn(false);
        setPage("dashboard");
        setSelectedTicketId(null);
      }}
    >
      

      {page === "dashboard" && <Dashboard />}

      {page === "new-ticket" && (
        <NewTicket
          onCreated={(ticketId) => {
            setSelectedTicketId(ticketId);
            setPage("ticket-details");
          }}
        />
      )}

      {page === "tickets" && (
        <Tickets
          onOpenTicket={(ticketId) => {
            setSelectedTicketId(ticketId);
            setPage("ticket-details");
          }}
        />
      )}

      {page === "ticket-details" &&
        selectedTicketId !== null && (
          <TicketDetails
            ticketId={selectedTicketId}
            onBack={() => setPage("tickets")}
          />
        )}
    </AppLayout>
  );
}

export default App;