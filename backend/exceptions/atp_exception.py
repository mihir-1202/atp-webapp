class ATPException(Exception):
    def __init__(self, message: str = "Error: Service temporarily unavailable", name: str = "ATP Error", details: str = None):
        self.name = name 
        self.message = message
        self.details = details
        
    def __str__(self):
        return f"{self.message}"
        
    def __repr__(self):
        return f"{self.__class__.__name__}(name={self.name}, message={self.message}, details={self.details})"