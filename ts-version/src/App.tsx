import React from "react";
import { useState } from "react";

interface Friend {
  id: number;
  name: string;
  image: string;
  balance: number;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ children, onClick }: ButtonProps) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

const initialFriends: Friend[] = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

export default function App() {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  function handleAddFriend(friend: Friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  function handleSelection(friend: Friend) {
    setSelectedFriend((cur) => (cur?.id === friend.id ? null : friend));
    setShowAddFriend(false);
  }

  function handleSplitBill(value: number) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend?.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );
    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection}
        />

        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}
        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add friend"}
        </Button>
      </div>

      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

interface FriendsListProps {
  friends: Friend[];
  onSelection: (friend: Friend) => void;
  selectedFriend: Friend | null;
}

function FriendsList({
  friends,
  onSelection,
  selectedFriend,
}: FriendsListProps) {
  return (
    <ul>
      {friends.map((friend) => (
        <FriendItem
          friend={friend}
          key={friend.id}
          selectedFriend={selectedFriend}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}

interface FriendItemProps {
  friend: Friend;
  onSelection: (friend: Friend) => void;
  selectedFriend: Friend | null;
}

function FriendItem({ friend, onSelection, selectedFriend }: FriendItemProps) {
  const isSelected = selectedFriend?.id === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} {Math.abs(friend.balance)}€
        </p>
      )}

      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you {Math.abs(friend.balance)}€
        </p>
      )}

      {friend.balance === 0 && <p>You and {friend.name} are even</p>}

      <Button onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

interface FormAddFriendProps {
  onAddFriend: (friend: Friend) => void;
}

function FormAddFriend({ onAddFriend }: FormAddFriendProps) {
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("https://i.pravatar.cc/48");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !image) return;

    const id = crypto.randomUUID();
    const newFriend: Friend = {
      id: parseInt(id.slice(0, 6), 16), // simplified id parsing
      name,
      image: `${image}?=${id}`,
      balance: 0,
    };

    onAddFriend(newFriend);
    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>🙋🏼‍♂️Friend name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label>📸 Image Url</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <Button>Add</Button>
    </form>
  );
}

interface FormSplitBillProps {
  selectedFriend: Friend;
  onSplitBill: (value: number) => void;
}

function FormSplitBill({ selectedFriend, onSplitBill }: FormSplitBillProps) {
  const [bill, setBill] = useState<number | "">("");
  const [paidByUser, setPaidByUser] = useState<number | "">("");
  const [whoIsPaying, setWhoIsPaying] = useState<"user" | "friend">("user");

  const paidByFriend =
    bill !== "" && paidByUser !== "" ? bill - paidByUser : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bill === "" || paidByUser === "") return;

    onSplitBill(whoIsPaying === "user" ? Number(paidByFriend) : -paidByUser);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <label>💰 Bill value</label>
      <input
        type="number"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      />

      <label>🙍🏼‍♀️ Your expense</label>
      <input
        type="number"
        value={paidByUser}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (bill !== "" && val <= bill) setPaidByUser(val);
        }}
      />

      <label>🙋🏼‍♂️ {selectedFriend.name}'s expense</label>
      <input type="text" value={paidByFriend} disabled />

      <label>🤑 Who is paying the bill</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value as "user" | "friend")}
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>
      <Button>Split bill</Button>
    </form>
  );
}
