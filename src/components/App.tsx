import { QueryClient, QueryClientProvider } from "react-query"
import IssueList from "./IssueList"

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className='p-4'>
                <h1 className='mb-4 text-3xl'>Issue List</h1>
                <IssueList />
            </div>
        </QueryClientProvider>
    )
}

export default App
