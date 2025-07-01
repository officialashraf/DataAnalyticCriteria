import CardList from './cards.js'
import styles  from './dashboard.module.css'
import DataTable from '../Case/caseList.js'

const Home = () => {

  return (
    <div style={{ height: "100%", width: "100%", flexDirection: "column", overflow: "hidden"}}>

      <div className={styles.row-1}>
        <CardList />
      </div>
      <div className={styles.row-2} >
        <DataTable />
      </div>
    </div>
  )
}

export default Home
