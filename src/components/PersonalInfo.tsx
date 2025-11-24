import { useMemo } from 'react'

const PersonalInfo = () => {
  const age = useMemo(() => {
    const today = new Date()
    const birthDate = new Date(2019, 1, 5) // February 5, 2019 (month is 0-indexed)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }, [])

  return (
    <section className="personal-summary">
      <div className="summary-text">
        <p className="summary-intro">Hello, I’m Aiden 👋</p>
        <p>
          I am {age} years old and study in Junior 1C at St. Paul College Primary School. I love drawing,
          reading with Dad and Mom, and riding the 4E school bus to class every day.
        </p>
      </div>
      <div className="summary-details">
        <div className="summary-item">
          <span className="summary-label">School</span>
          <span className="summary-value">St. Paul College Primary School</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Class</span>
          <span className="summary-value">Junior 1C · Student #17</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Birthday</span>
          <span className="summary-value">5 Feb 2019</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Home Base</span>
          <span className="summary-value">Seaside Sonata</span>
        </div>
      </div>
    </section>
  )
}

export default PersonalInfo

