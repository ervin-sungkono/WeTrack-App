import Button from "../button/Button"

export default function TablePagination({ pageIndex, pageSize, handlePageChange, hasPrevPage, hasNextPage, totalCount }){
    const startIndex = ((pageIndex - 1) * pageSize) + 1
    const endIndex = Math.min(pageIndex * pageSize, totalCount)

    return(
        <div className="flex flex-col-reverse md:flex-row justify-between items-center rounded-md">
            <p className="text-sm">Showing {startIndex} to {endIndex} of {totalCount} entries</p>
            <div className="flex justify-center items-center">
                <Button 
                    onClick={() => handlePageChange(pageIndex - 1)} 
                    size="sm" 
                    variant="secondary" 
                    className={"rounded-none rounded-l-lg"}
                    disabled={!hasPrevPage}
                >
                    Prev
                </Button>
                <div className="px-4 py-1.5 text-sm md:text-base bg-basic-blue text-white font-bold border border-basic-blue">{pageIndex}</div>
                <Button 
                    onClick={() => handlePageChange(pageIndex + 1)} 
                    size="sm" 
                    variant="secondary" 
                    className={"rounded-none rounded-r-lg"}
                    disabled={!hasNextPage}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}