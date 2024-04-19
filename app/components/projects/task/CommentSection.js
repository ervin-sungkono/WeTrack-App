export default function CommentSection({ comments }){
    if(comments == null){
        return(
            <div>Memuat data komentar..</div>
        )
    }
    return(
        <div>Comment</div>
    )
}