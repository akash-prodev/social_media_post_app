import { createContext, useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import {format} from "date-fns"

const DataContext = createContext({})

export const DataProvider = ({children}) => {
    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState ([])
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');
    const navigate = useNavigate()
    const {width} = useWindowSize()
  
    //Logic to fetch data
    const [fetchError, setFetchError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(()=>{
      const fetchPosts = async () =>{
        try{
          const response = (JSON.parse(localStorage.getItem('social_media_post_app')) || [])
          setPosts(response);
          setFetchError(null)
        }catch(err){
          setFetchError(err.message);
          setPosts(null)
      }finally{
        setTimeout(() => 
          setIsLoading(false), 2000)
      }
    }
    fetchPosts();
    }, [])

    useEffect(() => {
      const filteredResults = posts.filter((post) =>
      ((post.body).toLowerCase()).includes(search.toLowerCase()) ||
      ((post.title).toLowerCase()).includes (search.toLowerCase()));

      setSearchResults(filteredResults.reverse())
    }, [posts, search]);

    const handleSubmit = async (e) => {
          e.preventDefault();
          const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
          const datetime = format(new Date(), 'MMMM dd, yyyy pp');
          const newPost = { id, title: postTitle, datetime, body: postBody };
          try{
            const allPosts = [...posts, newPost];
            setPosts(allPosts);
            setPostTitle('');
            setPostBody('');
            navigate('/')
            localStorage.setItem('social_media_post_app', JSON.stringify(allPosts))
          } catch (err) {
             console.log(`Error: $(err.message}`);  
          }
      }

      const handleDelete = async (id) => {
        try{
          const postsList = posts.filter(post => post.id !== id);
          setPosts(postsList);
          navigate('/')
          localStorage.setItem('social_media_post_app', JSON.stringify(postsList))
        }
        catch(err){
          console.log(`Error: ${err.message}`);
        }
    }

    const handleEdit = async (event, id) => {
      event.preventDefault();
      const datetime = format(new Date(), 'MMMM dd, yyyy pp');
      const updatedPost = { id, title: editTitle, datetime, body: editBody };
      try {
        const updatedPosts = posts.map(post => post.id === id ? updatedPost : post);
        setPosts(updatedPosts);
        setPostTitle('');
        setPostBody('');
        navigate('/');
        localStorage.setItem('social_media_post_app', JSON.stringify(updatedPosts));
      } catch (err) {
        console.log(`Error: ${err.message}`);
      }
    };


    return (
        <DataContext.Provider value = {{
           width, search, setSearch,
           searchResults,
           handleSubmit, postTitle, setPostTitle,
           postBody, setPostBody,
           posts, handleEdit, editBody, setEditBody,
           editTitle, setEditTitle, handleDelete,
          fetchError, isLoading
        }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext