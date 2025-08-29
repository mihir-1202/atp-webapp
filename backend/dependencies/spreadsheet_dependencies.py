import openpyxl as xl
from typing import Dict, Any
from pathlib import Path
from typing import List, Dict, Any

class ATPSpreadsheetManager:
    #Represents the ATP spreadsheet for a specific ATP number.
    def __init__(self):
        pass
         
    def register_workbook(self, excel_filepath):
        try:
            self.excel_filepath = excel_filepath
            self.wb = xl.load_workbook(excel_filepath)
            self.ws = self.wb.active
        except Exception as e:
            raise IOError(f"Failed to ATP Template excel file: {str(e)}")
        return self
        
    """Saves the workbook to the specified filepath."""
    def save_workbook(self):
        self.wb.save(self.excel_filepath)
       
    """Content manager protocol for setup and teardown when creating ATP_Spreadsheet instances"""
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_value, traceback):
        self.save_workbook()
        self.wb.close()

    """Writes content to a specific cell in the worksheet."""
    def write_to_cell(self, cell_index: str, content: str):
        self.ws[cell_index] = content

    """Fills out the ATP spreadsheet with the provided data"""
    def populate_cells_with_responses(self, cell_to_response_mapping: Dict[str, Any]):
        for cell_index, response in cell_to_response_mapping.items():
            self.write_to_cell(cell_index, response)
        self.save_workbook()
        
def get_atp_spreadsheet_manager():
    return ATPSpreadsheetManager()
        
if __name__ == "__main__":
    excel_filepath = "C:/Users/mihirmehta/Downloads/testblob.xlsx"
    with ATPSpreadsheetManager(excel_filepath) as atp_spreadsheet:
        cell_to_response_mapping = {
            "A1": "Test response 1",
            "A2": "Test response 2",
            "A3": "Test response 3",
        }
        atp_spreadsheet.populate_cells_with_responses(cell_to_response_mapping)