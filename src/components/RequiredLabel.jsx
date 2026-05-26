const RequiredLabel = ({ text }) => (
    <label className="form-label">
        {text} <span className="text-danger">*</span>
    </label>
)

export default RequiredLabel