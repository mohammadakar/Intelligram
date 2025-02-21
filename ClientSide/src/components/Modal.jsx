const Modal = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={onClose}
        ></div>
        <div className="bg-white p-6 rounded shadow-lg z-10">
            {children}
            <button
            onClick={onClose}
            className="mt-4 text-blue-600 underline"
            >
            Close
            </button>
        </div>
        </div>
    );
};

export default Modal;
