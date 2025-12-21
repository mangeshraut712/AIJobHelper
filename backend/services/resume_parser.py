import PyPDF2
import docx
import io

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        text = ""
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text += page.extract_text()
        except Exception as e:
            print(f"PDF extraction error: {e}")
        return text

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        text = ""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"DOCX extraction error: {e}")
        return text

    @classmethod
    def extract_text(cls, file_bytes: bytes, filename: str) -> str:
        if filename.endswith(".pdf"):
            return cls.extract_text_from_pdf(file_bytes)
        elif filename.endswith(".docx"):
            return cls.extract_text_from_docx(file_bytes)
        else:
            return file_bytes.decode("utf-8", errors="ignore")
