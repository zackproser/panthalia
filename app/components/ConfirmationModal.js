export default function ConfirmationModal({ show, title, message, onConfirm, onClose }) {
  const modalClass = show ? "flex" : "hidden";
  return (
    <div id="myModal" className={`${modalClass} fixed top-0 left-0 w-full h-full flex items-center justify-center z-50`}>
      <div className="bg-white rounded-lg w-11/12 md:max-w-md mx-auto relative shadow-lg">
        <div className="p-4 text-left">
          <span id="closeModalBtn" className="absolute top-0 right-0 cursor-pointer p-4">
            &times;
          </span>
          <h2 className="text-2xl">{title}</h2>
          <p className="mt-4">
            {message}
          </p>
        </div>
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded mr-2">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-green-500 text-white rounded">
            Confirm
          </button>
        </div>
      </div>
    </div >
  );
}
