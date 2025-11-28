
import { useAppContext } from '../context/AppStateProvider';

interface UserSelectorProps {
    onAddUserClick: () => void;
}

export function UserSelector({ onAddUserClick }: UserSelectorProps) {
    const { availableUsers, selectedUserId, selectUser, selectedClientId } = useAppContext();

    if (!selectedClientId) {
        return null;
    }

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">User:</label>
            <select
                value={selectedUserId || ''}
                onChange={(e) => selectUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                    <option key={user.userId} value={user.userId}>
                        {user.firstName} {user.lastName}
                    </option>
                ))}
            </select>
            <button
                onClick={onAddUserClick}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold text-lg leading-none"
                title="Add new user"
            >
                +
            </button>
        </div>
    );
}
