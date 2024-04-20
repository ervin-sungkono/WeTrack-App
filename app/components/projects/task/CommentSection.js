export default function CommentSection({ comments }){
    if(!comments){
        return(
            <div>Memuat data komentar..</div>
        )
    }
    return(
        <div>Comment</div>
    )
}