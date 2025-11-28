
import { useAppContext } from '../context/AppStateProvider';

interface ClientSelectorProps {
    onAddClientClick: () => void;
}

export function ClientSelector({ onAddClientClick }: ClientSelectorProps) {
    const { clients, selectedClientId, selectClient } = useAppContext();

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Client:</label>
            <select
                value={selectedClientId || ''}
                onChange={(e) => selectClient(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                    <option key={client.clientId} value={client.clientId}>
                        {client.name}
                    </option>
                ))}
            </select>
            <button
                onClick={onAddClientClick}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold text-lg leading-none"
                title="Add new client"
            >
                +
            </button>
        </div>
    );
}
