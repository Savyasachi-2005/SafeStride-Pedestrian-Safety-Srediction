"""
Model File Verification Script

This script checks if all required model files are present and can be loaded.
Run this before starting the server to ensure everything is configured correctly.
"""

import sys
from pathlib import Path
import joblib

def check_model_files():
    """Check if all required model files exist and can be loaded"""
    
    model_dir = Path("MLT")
    required_files = [
        "SafeStride_Model.joblib",
        "SafeStride_LabelEncoder.joblib",
        "SafeStride_Features.joblib",
        "SafeStride_Metadata.joblib"
    ]
    
    print("=" * 60)
    print("SafeStride Model Files Verification")
    print("=" * 60)
    print()
    
    all_present = True
    all_loadable = True
    
    for filename in required_files:
        filepath = model_dir / filename
        print(f"Checking {filename}...")
        
        # Check existence
        if filepath.exists():
            print(f"  ✓ File exists: {filepath}")
            
            # Try to load
            try:
                data = joblib.load(filepath)
                print(f"  ✓ File is loadable")
                
                # Print some info about the loaded data
                if filename == "SafeStride_Model.joblib":
                    print(f"    Type: {type(data).__name__}")
                    if hasattr(data, 'n_features_in_'):
                        print(f"    Features: {data.n_features_in_}")
                
                elif filename == "SafeStride_LabelEncoder.joblib":
                    print(f"    Type: {type(data).__name__}")
                    if hasattr(data, 'classes_'):
                        print(f"    Classes: {list(data.classes_)}")
                
                elif filename == "SafeStride_Features.joblib":
                    if isinstance(data, list):
                        print(f"    Features count: {len(data)}")
                        print(f"    First 5: {data[:5]}")
                    else:
                        print(f"    Type: {type(data)}")
                
                elif filename == "SafeStride_Metadata.joblib":
                    if isinstance(data, dict):
                        print(f"    Keys: {list(data.keys())}")
                    else:
                        print(f"    Type: {type(data)}")
                
            except Exception as e:
                print(f"  ✗ Error loading file: {str(e)}")
                all_loadable = False
        else:
            print(f"  ✗ File NOT found: {filepath}")
            all_present = False
        
        print()
    
    # Summary
    print("=" * 60)
    if all_present and all_loadable:
        print("✓ SUCCESS: All model files are present and loadable!")
        print()
        print("You can now start the server:")
        print("  python main.py")
        print("  or")
        print("  .\\start.ps1")
        return 0
    else:
        print("✗ FAILURE: Some model files are missing or cannot be loaded.")
        print()
        print("Please ensure all 4 model files are in the 'MLT/' directory:")
        for filename in required_files:
            print(f"  - {filename}")
        return 1
    
    print("=" * 60)


if __name__ == "__main__":
    exit_code = check_model_files()
    sys.exit(exit_code)
